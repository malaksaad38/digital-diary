import {useEffect, useState} from 'react';

interface ServiceWorkerState {
    isSupported: boolean;
    isRegistered: boolean;
    registration: ServiceWorkerRegistration | null;
    isOnline: boolean;
    needsUpdate: boolean;
}

export function useServiceWorker() {
    const [state, setState] = useState<ServiceWorkerState>({
        isSupported: false,
        isRegistered: false,
        registration: null,
        isOnline: true,
        needsUpdate: false,
    });

    useEffect(() => {
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            setState((prev) => ({...prev, isSupported: true}));

            // Register service worker
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    setState((prev) => ({
                        ...prev,
                        isRegistered: true,
                        registration,
                    }));

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (
                                    newWorker.state === 'installed' &&
                                    navigator.serviceWorker.controller
                                ) {
                                    setState((prev) => ({...prev, needsUpdate: true}));
                                }
                            });
                        }
                    });

                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000); // Check every hour
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error);
                });

            // Listen for controlling service worker changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }

        // Monitor online/offline status
        const handleOnline = () => setState((prev) => ({...prev, isOnline: true}));
        const handleOffline = () => setState((prev) => ({...prev, isOnline: false}));

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const updateServiceWorker = () => {
        if (state.registration) {
            state.registration.waiting?.postMessage({type: 'SKIP_WAITING'});
        }
    };


    return {
        ...state,
        updateServiceWorker,
    };
}