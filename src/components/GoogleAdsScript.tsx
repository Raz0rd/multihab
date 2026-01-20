'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface TenantConfig {
  googleAdsId: string;
  googleAdsConversionLabel: string;
}

export default function GoogleAdsScript() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchTenantConfig() {
      try {
        const response = await fetch('/api/tenant');
        const data = await response.json();
        
        if (data.success && data.config && data.config.googleAdsId) {
          setConfig(data.config);
        }
      } catch (error) {
        // Silencioso - sem config = sem tags
      }
    }

    fetchTenantConfig();
  }, []);

  useEffect(() => {
    if (config && loaded) {
      // Inicializa o gtag com a configuração do tenant
      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => {
        (window as any).dataLayer.push(args);
      };
      (window as any).gtag = gtag;
      
      gtag('js', new Date());
      gtag('config', config.googleAdsId);

      // Função de conversão do Google Ads (chamada quando pagamento confirmado)
      (window as any).gtag_report_conversion = function(transactionId: string, value: number) {
        // Verificar se já foi enviada essa conversão
        const sentKey = 'conversion_sent_' + transactionId;
        if (localStorage.getItem(sentKey)) {
          console.log('Conversão já enviada para:', transactionId);
          return false;
        }
        
        gtag('event', 'conversion', {
          'send_to': config.googleAdsConversionLabel,
          'value': value || 1.0,
          'currency': 'BRL',
          'transaction_id': transactionId
        });
        
        // Marcar como enviada
        localStorage.setItem(sentKey, 'true');
        console.log('Conversão enviada para Google Ads:', transactionId);
        return true;
      };
    }
  }, [config, loaded]);

  if (!config) {
    return null;
  }

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAdsId}`}
      strategy="afterInteractive"
      onLoad={() => setLoaded(true)}
    />
  );
}
