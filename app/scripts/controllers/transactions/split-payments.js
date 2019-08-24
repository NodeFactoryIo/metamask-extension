import { SplitWallet } from '@nodefactory/split-paymanet-sdk';

class SplitPaymentsController {
  constructor(getSelectedAddress) {
    const address = getSelectedAddress();
    this.splitWallet = new SplitWallet(address);
  }

  loadPendingPaymentRequests() {

  }
}

module.exports = SplitPaymentsController;
