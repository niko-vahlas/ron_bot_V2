import { swap } from './swap.js';
import { getTokenBalance } from './helpers/getTokenBalance.js';
import { getTokenPrice } from './helpers/getTokenPrice.js';

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

  const stopLoss = 0.85 * buyPrice;
  const takeProfit = 1.2 * buyPrice;

  let passCount = 0;
  while (passCount < 1800) {
    const tokenBalance = await getTokenBalance(contractAddress);
    if (tokenBalance === 0) {
      console.log('No tokens left to sell');
      break;
    }

    const currentPrice = await getTokenPrice(contractAddress);
    if (!currentPrice) {
      console.log("Couldn't get current price");
      continue;
    }

    if (currentPrice <= stopLoss) {
      // Sell everything
    } else if (currentPrice > takeProfit) {
      //Take profit, change our stoploss and and our take profit
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
