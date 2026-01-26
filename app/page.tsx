import ConnectButton from "@algobright/solana-connector/ConnectButton";
import styles from "./page.module.css";
export default function Home() {
  return (
    <div className={styles.page}>
      <span className={styles.version}>Version: 0.1.0</span>

      <div className={styles.eachButton}>
        <span>Light Theme,SolBalance </span>
        <ConnectButton
          showSolBalance
          theme='light'
          CN_ConnectButton={styles.connectButton}
          showDefaultToken={{
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: "USDC"
          }}
        />
      </div>

      <div className={styles.eachButton}>
        <span>Dark Theme,SolBalance </span>
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
