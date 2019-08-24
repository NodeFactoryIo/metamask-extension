import { SplitWallet } from '@nodefactory/split-payment-sdk';
const ThreeBoxController = require('../threebox');
const ObservableStore = require('obs-store')
const ethUtil = require('ethereumjs-util')

class SplitPaymentsController {
  constructor(opts = {}) {
    const { getSelectedAddress, platform, newUnapprovedTransaction, keyringController } = opts;

    this.platform = platform;
    this.keyringController = keyringController;
    this.newUnapprovedTransaction = newUnapprovedTransaction;
    const address = getSelectedAddress();
    if (address) {
      this.address = ethUtil.toChecksumAddress(address);
    }

    const initState = {
      readNotifications: [],
      ...opts.initState,
      pendingRequestedTxs: [],
    };

    this.store = new ObservableStore(initState)

    this.init();
  }

  setAsRead(notification) {
    const store = this.store.getState();
    console.log("store in setAsRead is: ", store);
    store.putState(store.readNotifications.push(notification));
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
    // Set as read notification
    // this.setAsRead(payment);
  }

  async init() {
    if (!this.address) {
      const accounts = await this.keyringController.getAccounts()
      this.address = accounts[0]
    }
    this.splitWallet = new SplitWallet(this.address);

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
    const all = await SplitWallet.getAllPaymentRequests(this.address);
    const readNotifications = this.store.getState().readNotifications;

    const filtered = [];
    all.map((notification) => {
      let isRead = false;
      for (let i = 0; i < readNotifications.length; i++) {
        if (JSON.stringify(notification) === JSON.stringify(readNotifications[i])) {
          isRead = true;
          break;
        }
      }
      if (!isRead) filtered.push(notification);
    });

    return filtered;
  }
}

module.exports = SplitPaymentsController;
