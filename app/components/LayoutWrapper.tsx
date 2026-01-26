import React from 'react';
import styles from './Layout.module.css';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.main}>
            <div className={styles.contentContainer}>
                <Navbar />
                {children}
                <Footer />
            </div>
        </div>
    )
}

export default LayoutWrapper