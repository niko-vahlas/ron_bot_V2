import { swap } from './swap.js';
import { getTokenCountInWallet } from './helpers/getTokenCountInWallet.js';
import { getTokenPrice } from './helpers/getTokenPrice.js';
import { getTokenDecimals } from './helpers/getTokenDecimals.js';

export async function makeMoney(contractAddress: string) {
  const solana = 'So11111111111111111111111111111111111111112';
  const buyResult = await swap(solana, contractAddress);
  if (!buyResult) {
    console.log('Buy was unsuccessful');
    return;
  }

  // Returns price in USD
  const buyPrice = await getTokenPrice(contractAddress);
  if (!buyPrice) {
    console.log('Issue with buy price');
    return;
  }
  console.log(`Buy price was ${buyPrice}`);

  const tokenDecimals = await getTokenDecimals(contractAddress);
  if (!tokenDecimals) {
    console.log('Issue with getting decimal count');
    return;
  }
  console.log(`Decimal count was ${tokenDecimals}`);

  let stopLoss = 0.85 * buyPrice;
  let takeProfit = 1.2 * buyPrice;

  let passCount = 0;
  while (passCount < 1800) {
    const tokenBalance = await getTokenCountInWallet(contractAddress);
    if (tokenBalance === 0) {
      console.log('No tokens left to sell');
      break;
    }
    console.log(`Balance for token ${contractAddress} is ${tokenBalance}`);

    let currentPrice = await getTokenPrice(contractAddress);
    if (!currentPrice) {
      console.log("Couldn't get current price");
    }
    console.log(`Current price of ${contractAddress} is ${currentPrice}`);

    if (currentPrice && currentPrice <= stopLoss) {
      const amountToSell = String(
        getAmountInSmallestUnit(tokenBalance, tokenDecimals)
      );
      const sellResult = await swap(contractAddress, solana, amountToSell);
      if (!sellResult) {
        console.log('Sell was unsuccessful');
      }
    } else if (currentPrice && currentPrice > takeProfit) {
      const amountToSell = String(
        getAmountInSmallestUnit(Number(tokenBalance * 0.5), tokenDecimals)
      );
      console.log(`Amount to sell is ${amountToSell}`);
      const sellResult = await swap(contractAddress, solana, amountToSell);
      console.log(`Sell result is ${sellResult}`);
      if (!sellResult) {
        console.log('Sell was unsuccessful');
      } else {
        console.log(`Sell result is ${sellResult}`);
        currentPrice = takeProfit;
        stopLoss = takeProfit * 0.85;
        takeProfit = takeProfit * 1.2;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

function getAmountInSmallestUnit(amount: number, decimals: number): string {
  return (amount * 10 ** decimals).toFixed(0);
}
