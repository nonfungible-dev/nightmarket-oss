import { CoinGeckoClient } from 'coingecko-api-v3';
import React, { useCallback, useEffect, useState } from 'react';

const COIN_GECKO_CURRENCY_IDS: {[key: string]: string} = {
  SOL: "solana",
  USD: "usd"
}

interface ICurrencyContext {
  solToUsd(sol: number): number;
  solToUsdString(sol: number): string;
}

export const CurrencyContext = React.createContext<ICurrencyContext | null>(null);

const USD_FORMATTER: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

interface CurrencyProviderProps {
  children: JSX.Element;
}

export default function CurrencyProvider(props: CurrencyProviderProps): JSX.Element {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [solPrice, setSolPrice] = useState<number>();

  useEffect(() => {
    const client = new CoinGeckoClient({
      timeout: 10000,
      autoRetry: true,
    });
    client.simplePrice({
      ids: COIN_GECKO_CURRENCY_IDS.SOL,
      vs_currencies: COIN_GECKO_CURRENCY_IDS.USD
    }).then(r => {
      setSolPrice(r[COIN_GECKO_CURRENCY_IDS.SOL][COIN_GECKO_CURRENCY_IDS.USD]);
    }).finally(() => setInitialized(true));
  }, [setSolPrice, setInitialized]);

  const solToUsd: ICurrencyContext['solToUsd'] = useCallback(
    (sol) => {
      if (!initialized) {
        return 0;
      }
      if (solPrice == null) {
        throw new Error('No known conversion rate from SOL to USD.');
      }
      return sol * solPrice;
    },
    [initialized, solPrice]
  );

  const solToUsdString: ICurrencyContext['solToUsdString'] = useCallback(
    (sol) => USD_FORMATTER.format(solToUsd(sol)),
    [solToUsd]
  );

  return (
    <CurrencyContext.Provider value={{ solToUsd, solToUsdString }}>
      {props.children}
    </CurrencyContext.Provider>
  );
}
