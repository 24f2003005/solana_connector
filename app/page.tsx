"use client";

import ConnectButton from "@algobright/solana-connector/ConnectButton";
import styles from "./page.module.css";
import { appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createSignableMessage, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners, TransactionSigner } from "@solana/kit";
import { createKitSignersFromWallet, solToLamports, useCluster, useConnector, useConnectorClient, useKitTransactionSigner } from "@solana/connector";
import { useMemo } from "react";
import { getTransferSolInstruction } from "@solana-program/system";
import { getBase58SignatureFromSignedTransaction, getWebSocketUrlForRpcUrl } from "./utils/rpc_utils";
import { toast } from "./providers/ToastProvider";


export default function Home() {
  const { signer } = useKitTransactionSigner();

  const { walletStatus, connectorId } = useConnector();
  const { cluster } = useCluster();
  const client = useConnectorClient();


  const wallet = useMemo(() => {
    if (!client || !connectorId) return null;
    return client.getConnector(connectorId);
  }, [client, connectorId]);

  const account = walletStatus.status === 'connected'
    ? walletStatus.session.selectedAccount.account
    : null;

  // Create Kit-compatible signers from wallet
  const kitSigners = useMemo(() => {
    if (!wallet || !account || !cluster || !client) return null;
    const rpcUrl = client.getRpcUrl();
    if (!rpcUrl) return null;
    return createKitSignersFromWallet(wallet, account, null, undefined);
  }, [wallet, account, cluster, client]);


  const signMessage = async () => {

    if (!kitSigners?.messageSigner) {
      toast.error("Message signer not available");
      return;
    }

    const messageToSign = "Hello, Algobright!";
    try {
      const messageBytes = new TextEncoder().encode(messageToSign);
      const signableMessage = createSignableMessage(messageBytes);

      toast.success("Sending sign request...");
      const signedMessages = await kitSigners.messageSigner.modifyAndSignMessages([signableMessage]);

      if (!Array.isArray(signedMessages) || signedMessages.length === 0) {
        throw new Error('Signer did not return signed messages');
      }

      const signed = signedMessages[0];
      if (!signed || !signed.signatures || typeof signed.signatures !== 'object') {
        throw new Error('Invalid signed message structure');
      }

      const signatureValues = Object.values(signed.signatures);
      if (signatureValues.length === 0) {
        throw new Error('No signatures found in signed message');
      }

      const signature = signatureValues[0];
      if (!(signature instanceof Uint8Array)) {
        throw new Error('Signature is not a Uint8Array');
      }

      const signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));
      console.log('Signed message (base64):', signatureBase64);
      toast.success('Message signed successfully!');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign message';
      console.error('Message signing error:', err);
    } finally {
    }
  };


  const signTransfer = async () => {
    if (!signer || !client) return;

    const rpcUrl = client.getRpcUrl();
    if (!rpcUrl) throw new Error('No RPC endpoint configured');

    // Create RPC client using web3.js 2.0
    const rpc = createSolanaRpc(rpcUrl);


    try {
      const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
      const amountInLamports = solToLamports(0.00001);
      const transferInstruction = getTransferSolInstruction({
        source: signer as TransactionSigner,
        destination: signer.address,
        amount: amountInLamports,
      });

      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        tx => setTransactionMessageFeePayerSigner(signer, tx),
        tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        tx => appendTransactionMessageInstructions([transferInstruction], tx),
      );
      toast.success("Sending Self transfer signing request...");
      const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
      const signatureBase58 = getBase58SignatureFromSignedTransaction(signedTransaction);


      assertIsTransactionWithBlockhashLifetime(signedTransaction);

      const rpcSubscriptions = createSolanaRpcSubscriptions(getWebSocketUrlForRpcUrl(rpcUrl));
      await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(signedTransaction, {
        commitment: 'confirmed',
      });
      toast.success('Transfer transaction signed successfully!');
      console.log('Transfer transaction signature (base58):', signatureBase58);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
      toast.error(`Transaction signing error: ${errorMessage}`);
    }

  };

  return (
    <div className={styles.page}>
      <span className={styles.version}>Version: 0.1.12</span>

      <div className={styles.signTestButtons}>
        <span>Test Sign Tx</span>
        <div className={styles.signButtons}>
          <button onClick={signMessage}>Test Sign Message</button>
          <button onClick={signTransfer}>Test Self Transfer</button>
        </div>
      </div>

      <div className={styles.eachButton}>
        <span>Light Theme,SolBalance </span>
        <ConnectButton
          showSolBalance
          theme='light'
          CN_ConnectButton={styles.connectButton}
        />
      </div>

      <div className={styles.eachButton}>
        <span>Dark Theme,SolBalance ,USDC</span>
        <ConnectButton
          showSolBalance
          theme='dark'
          CN_ConnectButton={styles.connectButton}
          showDefaultToken={{
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: "USDC"
          }}
        />
      </div>

      <div className={styles.eachButton}>
        <span>USDC Balance only</span>
        <ConnectButton
          theme="dark"
          CN_ConnectButton={styles.connectButton}
          showDefaultToken={{
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: "USDC"
          }}
        />

      </div>
      <div className={styles.eachButton}>
        <span>USDC Balance only</span>
        <ConnectButton
          showSolBalance
          theme="dark"
          CN_ConnectButton={styles.connectButton}
          showDefaultToken={{
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: "USDC"
          }}
        />

      </div>
    </div>
  );
}



