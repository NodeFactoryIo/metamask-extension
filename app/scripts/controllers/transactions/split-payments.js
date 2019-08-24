import { SplitWallet } from '@nodefactory/split-payment-sdk';
const ThreeBoxController = require('../threebox');
const ObservableStore = require('obs-store')
const ethUtil = require('ethereumjs-util')

class SplitPaymentsController {
  constructor(opts = {}) {
    const { getSelectedAddress, platform, newUnapprovedTransaction } = opts;

    this.platform = platform;
    this.newUnapprovedTransaction = newUnapprovedTransaction;
    this.address = ethUtil.toChecksumAddress(getSelectedAddress());
    this.splitWallet = new SplitWallet(this.address);

    const initState = {
      pendingRequestedTxs: [],
    };
    this.store = new ObservableStore(initState)

    this.init();
  }

  async onNewPaymentRequest(payment) {
    console.log("new payment: ", payment);
    const { from, amount, currency } = payment;

    // Display notification
    const name = await ThreeBoxController.getAddressName(from);
    this.platform.showPendingPaymentNotification({
      name,
      amount,
      currency,
    });

    // Display sending popup
    this.newUnapprovedTransaction({
      value: amount.toString(),
      to: from,
      from: this.address,
    });
  }

  async init() {
    // todo: load from storage previous ones

    console.log(`Going to load pending payment requests for address ${this.address}...`);
    const pending = await this.loadPendingPaymentRequests();
    console.log("pending are: ", pending);
    this.store.updateState({
      pendingRequestedTxs: pending,
    });

    const onRequest = this.onNewPaymentRequest.bind(this);
    this.splitWallet.onNewPaymentRequest(onRequest);
    console.log("Going to start polling...");
    this.splitWallet.startPolling();
  }

  async loadPendingPaymentRequests() {
    return await SplitWallet.getAllPaymentRequests(this.address);
  }
}

module.exports = SplitPaymentsController;
