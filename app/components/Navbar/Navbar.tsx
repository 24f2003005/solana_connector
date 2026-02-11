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
                    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
                    symbol: "BONK"
                }}
            />
        </div>
    )
}

export default Navbar