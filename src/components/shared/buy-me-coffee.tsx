'use client';

import { useEffect } from 'react';

interface BuyMeCoffeeProps {
  className?: string;
}

export function BuyMeCoffee({ className }: BuyMeCoffeeProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
    script.setAttribute('data-name', 'BMC-Widget');
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-id', 'alexfromvan');
    script.setAttribute('data-description', 'Support me on Buy me a coffee!');
    script.setAttribute('data-message', 'Thanks for visiting :) You can now buy me a coffee to support my work.');
    script.setAttribute('data-color', '#FFDD00');
    script.setAttribute('data-position', 'Right');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '18');
    
    script.async = true;
    
    // Manually trigger DOMContentLoaded after script loads
    script.onload = function() {
      const evt = document.createEvent('Event');
      evt.initEvent('DOMContentLoaded', false, false);
      window.dispatchEvent(evt);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      const button = document.querySelector('#bmc-wbtn');
      if (button?.parentElement) {
        button.parentElement.removeChild(button);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return <div id="bmc-wbtn-container" className={className} />;
} 