import { SplitWallet } from '@nodefactory/split-payment-sdk';
const ObservableStore = require('obs-store')
const ethUtil = require('ethereumjs-util')

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
    console.log("new payment: ", payment);
  }

  async init() {
    // todo: load from storage previous ones

    console.log(`Going to load pending payment requests for address ${this.address}...`);
    const pending = await this.loadPendingPaymentRequests();
    console.log("pending are: ", pending);
    this.store.updateState({
      pendingRequestedTxs: pending,
    });

    this.splitWallet.onNewPaymentRequest(this.onNewPaymentRequest);
    console.log("Going to start polling...");
    this.splitWallet.startPolling();
  }

  async loadPendingPaymentRequests() {
    const checksummedAddress = ethUtil.toChecksumAddress(this.address);
    return await SplitWallet.getAllPaymentRequests(checksummedAddress);
  }
}

module.exports = SplitPaymentsController;
