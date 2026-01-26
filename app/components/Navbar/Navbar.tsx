"use client";

import styles from './Navbar.module.css'
import ConnectButton from '@algobright/solana-connector/ConnectButton'

const Navbar = () => {


    return (
        <div className={styles.main}>
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
    )
}

export default Navbar