import { buy } from './buy';
import { getTokenBalance } from './helpers/getTokenBalance';
import { getTokenPrice } from './helpers/getTokenPrice';

export async function makeMoney(
  contractAddress: string,
  walletAddress: string
) {
  const buyResult = await buy(contractAddress);
  if (!buyResult) {
    console.log('Buy was unsuccessful');
    return;
  }

  const buyPrice = getTokenPrice(contractAddress);
  if (!buyPrice) {
    console.log('Issue with buy price');
    //REMOVE THIS RETURN
    return;
  }

  let passCount = 0;
  while (passCount < 500) {
    const tokenBalance = await getTokenBalance(contractAddress, walletAddress);
    if (tokenBalance === 0) {
      console.log('No tokens left to sell');
      break;
    }
    const currentPrice = await getTokenPrice(contractAddress);
    if (currentPrice) {
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
