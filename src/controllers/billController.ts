import { Request, Response, NextFunction } from 'express';
import Bill from '../models/billModel';
import catchAsync from '../helper/catchAsync';
import User from '../models/userModel';
import HttpException from '../helper/apiError';

// @desc createBill
// @endpoint POST api/v1/bills
// @access protected
const createBill = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, price, paidBy, shareWith } = req.body;
    const bill = await Bill.create({ title, price, paidBy, shareWith });
    const user = await User.findById(bill.paidBy);
    const addCredit = bill.shareWith;
    const divide = bill.price / bill.shareWith.length;
    let friends = await User.find().where('_id').in(addCredit).exec();
    for (let i = 0; i < friends.length; i++) {
      friends[i].credit += divide;
      await friends[i].save();
    }
    user.debt += bill.price;
    user.billsHePaid.push(bill.id);
    await user.save();

    res.status(201).json({
      status: 'success',
      data: bill,
    });
  }
);

// @desc get all bills (current bills that we not calculate yet)
// @endpoint GET api/v1/bills
// @access protected
const getAllBills = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bills = await Bill.find({ done: false });

    res.status(200).json({
      status: 'success',
      result: bills.length,
      data: bills,
    });
  }
);

// @desc get all old bills (if you need to take a look)
// @endpoint GET api/v1/bills/oldbills
// @access protected

const getAllOldBills = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const bills = await Bill.find({ done: true });

    res.status(200).json({
      status: 'success',
      result: bills.length,
      data: bills,
    });
  }
);

// @desc delete all bills including current and old one (be careful because that means actual delete all bills from DATABASE)
// @endpoint DELETE api/v1/bills
// @access protected
const deleteAllBills = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Bill.deleteMany();
    await User.updateMany(
      {},
      { $set: { debt: 0, credit: 0, billsHePaid: [], billsResult: 0 } }
    );
    res.status(204).json({ data: null });
  }
);

// @desc delete specific bill including current and old one (be careful because that means actual delete this bill from DATABASE)
// @endpoint DELETE api/v1/bills/:billId
// @access protected
const deleteBill = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const bill = await Bill.findById({ _id: billId });
    if (!bill) {
      return next(new HttpException(404, 'There is no bill with This ID!'));
    }

    const deleteDebtForPaidBy = await User.findById(bill.paidBy);
    const deleteCredit = bill.shareWith;
    const divide = bill.price / bill.shareWith.length;
    let friends = await User.find().where('_id').in(deleteCredit).exec();
    for (let i = 0; i < friends.length; i++) {
      if (friends[i]) {
        friends[i].credit -= divide;
        await friends[i].save();
      }
    }

    deleteDebtForPaidBy.debt -= bill.price;
    deleteDebtForPaidBy.billsHePaid.splice(
      deleteDebtForPaidBy.billsHePaid.findIndex((el) => el.id === bill.id),
      1
    );
    await deleteDebtForPaidBy.save();
    await bill.remove();
    res.status(204).json({
      status: 'success',
      data: bill,
    });
  }
);

// @desc GET all current bills Paid By specific user (if you need to know where your fucking money going on)
// @endpoint GET api/v1/bills/newbills/:userId
// @access protected

const getNewbillsPaidBySpecificUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await User.findById({ _id: userId });
    const bills = await Bill.find({ done: false });
    if (!user) {
      return next(new HttpException(404, 'There is no User with This ID!'));
    }
    const data = bills.filter(
      (bill) => JSON.stringify(bill.paidBy._id) === JSON.stringify(user._id)
    );

    res.status(200).json({ Result: data.length, data: data });
  }
);

// @desc GET all old bills Paid By specific user
// @endpoint GET api/v1/bills/oldbills/:userId
// @access protected

const getOldbillsPaidBySpecificUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const user = await User.findById({ _id: userId });
    const bills = await Bill.find({ done: true });
    if (!user) {
      return next(new HttpException(404, 'There is no User with This ID!'));
    }
    const data = bills.filter(
      (bill) => JSON.stringify(bill.paidBy._id) === JSON.stringify(user._id)
    );

    res.status(200).json({ Result: data.length, data: data });
  }
);

// @desc GET all current bills that we not done from it yet, that looks like weird because I'm using <User> Model to calculate the diffirence between User DEBT and CREDIT
// @endpoint GET api/v1/bills/oldbills/:userId
// @access protected

const weNeedToTalk = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const friends = await User.find({});
    const data = friends.map((user) => {
      return [`${user.name}:`, Math.round(user.debt) - Math.round(user.credit)];
    });

    res.status(200).json({ data });
  }
);

// @desc   finishing from all current bills, which means all current bills will moving to oldbills and user.debt and user.credit user.billsHePaid returning to zero
// @endpoint POST api/v1/bills/done
// @access protected

const checkoutBills = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await Bill.updateMany({ done: false }, { $set: { done: true } });
    await User.updateMany(
      {},
      { $set: { debt: 0, credit: 0, billsHePaid: [] } }
    );
    res.status(200).json({ data: 'Okay, We Done Here!' });
  }
);

export {
  createBill,
  getAllBills,
  checkoutBills,
  deleteAllBills,
  deleteBill,
  getNewbillsPaidBySpecificUser,
  weNeedToTalk,
  getAllOldBills,
  getOldbillsPaidBySpecificUser,
};
