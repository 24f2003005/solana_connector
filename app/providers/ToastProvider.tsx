"use client";

import * as React from 'react';
import { Toast } from '@base-ui/react/toast';
import styles from './toast.module.css';

export const toastManager = Toast.createToastManager();

export const toast = {
    success: (title: string, description?: string) => {
        toastManager.add({
            title,
            description,
            data: { type: 'success' },
        });
    },
    error: (title: string, description?: string) => {
        toastManager.add({
            title,
            description,
            data: { type: 'error' },
        });
    },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <Toast.Provider toastManager={toastManager} timeout={3000}>
            {children}
            <Toast.Portal>
                <Toast.Viewport className={styles.Viewport}>
                    <ToastList />
                </Toast.Viewport>
            </Toast.Portal>
        </Toast.Provider>
    );
}

function ToastList() {
    const { toasts } = Toast.useToastManager();

    return toasts.map((t) => (
        <Toast.Root
            key={t.id}
            toast={t}
            // Mapping the custom data type to a class for specific colors
            className={`${styles.Toast} ${t.data?.type === 'success' ? styles.success : styles.error}`}
        >
            <Toast.Content className={styles.Content}>
                <div className={styles.TextContainer}>
                    <Toast.Title className={styles.Title}>{t.title}</Toast.Title>
                    {t.description && (
                        <Toast.Description className={styles.Description}>
                            {t.description}
                        </Toast.Description>
                    )}
                </div>
                <Toast.Close className={styles.Close}>
                    <XIcon className={styles.Icon} />
                </Toast.Close>
            </Toast.Content>
        </Toast.Root>
    ));
}

function XIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}