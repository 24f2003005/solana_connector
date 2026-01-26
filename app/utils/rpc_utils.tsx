import { signatureBytesToBase58 } from "@solana/connector";

export function getWebSocketUrlForRpcUrl(rpcUrl: string): string {
    const url = new URL(rpcUrl);
    url.protocol = url.protocol.replace('http', 'ws');

    // solana-test-validator defaults to HTTP 8899 and WS 8900
    if ((url.hostname === 'localhost' || url.hostname.startsWith('127')) && (url.port === '8899' || url.port === '')) {
        url.port = '8900';
    }
    console.log('WebSocket URL:', url.toString());
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
