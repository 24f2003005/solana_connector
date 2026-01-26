import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AlgoBright Solana Connector',
        short_name: 'AlgoBright',
        description: 'AlgoBright Solana Connector Example',
        start_url: '/',
        display: 'standalone',
        background_color: '#0d7ccf',
        theme_color: '#0d7ccf',
        icons: [
            {
                src: '/logo-96x96.png',
                sizes: '96x96',
                type: 'image/png',
            },
            {
                src: '/logo-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}