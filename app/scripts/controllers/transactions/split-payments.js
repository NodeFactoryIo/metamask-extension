import { SplitWallet } from '@nodefactory/split-payment-sdk';
const ObservableStore = require('obs-store')

class SplitPaymentsController {
  constructor(opts = {}) {
    const { getSelectedAddress } = opts;

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

    console.log("Going to load pending payment requests...");
    const pending = await this.loadPendingPaymentRequests();
    this.store.updateState({
      pendingRequestedTxs: pending,
    });

    this.splitWallet.onNewPaymentRequest(this.onNewPaymentRequest);
    console.log("Going to start polling...");
    this.splitWallet.startPolling();
  }

  async loadPendingPaymentRequests() {
    return SplitWallet.getAllPaymentRequests(this.address);
  }
}

module.exports = SplitPaymentsController;
