"use client";

import ConnectButton from "@algobright/solana-connector/ConnectButton";
import styles from "./page.module.css";
import { appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createSignableMessage, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, lamports, pipe, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners, TransactionSigner } from "@solana/kit";
import { createKitSignersFromWallet, signatureBytesToBase58, solToLamports, useCluster, useConnector, useConnectorClient, useKitTransactionSigner } from "@solana/connector";
import { useMemo } from "react";
import { getTransferSolInstruction } from "@solana-program/system";


export default function Home() {
  const { signer, ready } = useKitTransactionSigner();

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
      console.error("Message signer not available");
      return;
    }

    const messageToSign = "Hello, Algobright!";

    try {
      const messageBytes = new TextEncoder().encode(messageToSign);
      const signableMessage = createSignableMessage(messageBytes);

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
      alert('Message signed successfully! Check console for signature.');
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

    let signatureBase58: string | null = null;

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
      const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
      signatureBase58 = getBase58SignatureFromSignedTransaction(signedTransaction);


      assertIsTransactionWithBlockhashLifetime(signedTransaction);

      const rpcSubscriptions = createSolanaRpcSubscriptions(getWebSocketUrlForRpcUrl(rpcUrl));
      const txSend = await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(signedTransaction, {
        commitment: 'confirmed',
      });
      console.log('Transfer transaction signature (base58):', txSend);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign transaction';
      console.error('Transaction signing error:', err);
    } finally {
      if (signatureBase58) {
        console.log('Transfer transaction signature (base58):', signatureBase58);
        alert('Transfer signed successfully! Check console for signature.');
      }
    }

  };

  return (
    <div className={styles.page}>
      <span className={styles.version}>Version: 0.1.5</span>

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


export function getWebSocketUrlForRpcUrl(rpcUrl: string): string {
  const url = new URL(rpcUrl);
  url.protocol = url.protocol.replace('http', 'ws');

  // solana-test-validator defaults to HTTP 8899 and WS 8900
  if ((url.hostname === 'localhost' || url.hostname.startsWith('127')) && (url.port === '8899' || url.port === '')) {
    url.port = '8900';
  }

  return url.toString();
}

export function getBase58SignatureFromSignedTransaction(transaction: unknown): string {
  if (!transaction || typeof transaction !== 'object') {
    throw new Error('Invalid signed transaction');
  }

  const tx = transaction as { messageBytes?: Uint8Array; signatures?: Record<string, Uint8Array> };
  const messageBytes = tx.messageBytes;
  const signatures = tx.signatures;

  if (!(messageBytes instanceof Uint8Array) || !signatures || typeof signatures !== 'object') {
    throw new Error('Signed transaction missing messageBytes/signatures');
  }

  const numSigners = getNumRequiredSigners(messageBytes);
  if (numSigners !== 1) {
    throw new Error(
      `This demo currently supports single-signer transactions (found ${numSigners} required signers)`,
    );
  }

  const firstSig = Object.values(signatures)[0];

  if (!(firstSig instanceof Uint8Array) || firstSig.length !== 64) {
    throw new Error('Signed transaction missing first signature');
  }

  return signatureBytesToBase58(firstSig as unknown as Parameters<typeof signatureBytesToBase58>[0]);
}


function getNumRequiredSigners(messageBytes: Uint8Array): number {
  let offset = 0;

  if (messageBytes.length < 4) {
    throw new Error('Invalid message: too short for header');
  }

  // Versioned messages have a version prefix (0x80 | version). Legacy messages do not.
  if ((messageBytes[0] & 0x80) !== 0) {
    offset = 1;
  }

  if (offset >= messageBytes.length) {
    throw new Error('Invalid message: incomplete header');
  }

  return messageBytes[offset];
}
