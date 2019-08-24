import { SplitWallet } from '@nodefactory/split-payment-sdk';

class SplitPaymentsController {
  constructor(getSelectedAddress) {
    this.address = getSelectedAddress();
    this.splitWallet = new SplitWallet(this.address);

    const initState = {
      pendingRequestedTxs: [],
    };
    this.store = new ObservableStore(initState)

    this.init();
  }

  onNewPaymentRequest(payment) {
    console.log(payment);
  }

  async init() {
    // todo: load from storage previous ones

    const pending = await this.loadPendingPaymentRequests();
    this.store.updateState({
      pendingRequestedTxs: pending,
    });

    this.splitWallet.onNewPaymentRequest(this.onNewPaymentRequest);
    this.splitWallet.startPolling();
  }

  async loadPendingPaymentRequests() {
    return SplitWallet.getAllPaymentRequests(this.address);
  }
}

module.exports = SplitPaymentsController;
