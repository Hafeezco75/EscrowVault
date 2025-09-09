'use client';

import { useEffect } from 'react';

/**
 * Custom hook to handle browser extension hydration issues
 * Specifically addresses bis_skin_checked and other extension-added attributes
 */
export function useHydrationFix() {
  useEffect(() => {
    const cleanupExtensionAttributes = () => {
      // List of problematic attributes added by browser extensions
      const extensionAttributes = [
        'bis_skin_checked',
        '__processed',
        'data-bis-processed', 
        'data-extension-processed',
        'data-adblock-key',
        '__reactInternalInstance',
        '__reactEventHandlers'
      ];

      // Remove extension attributes that cause hydration mismatches
      extensionAttributes.forEach(attr => {
        const elements = document.querySelectorAll(`[${attr}]`);
        elements.forEach(element => {
          element.removeAttribute(attr);
        });
      });
    };

    // Initial cleanup
    cleanupExtensionAttributes();

    // Set up mutation observer to clean attributes as they're added
    const observer = new MutationObserver((mutations) => {
      let shouldCleanup = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;
          if (attrName && (
            attrName.includes('bis_skin_checked') ||
            attrName.includes('__processed') ||
            attrName.includes('data-bis') ||
            attrName.includes('data-extension')
          )) {
            shouldCleanup = true;
          }
        }
      });
      
      if (shouldCleanup) {
        cleanupExtensionAttributes();
      }
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeOldValue: true,
      subtree: true
    });

    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []);
}