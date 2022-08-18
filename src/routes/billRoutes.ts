import { Router } from 'express';
import { restricted } from '../controllers/userController';
import {
  createBill,
  getAllBills,
  checkoutBills,
  deleteAllBills,
  deleteBill,
  getNewbillsPaidBySpecificUser,
  getOldbillsPaidBySpecificUser,
  weNeedToTalk,
  getAllOldBills,
} from '../controllers/billController';

const router = Router();

router.use(restricted);

router.route('/').post(createBill).get(getAllBills).delete(deleteAllBills);
router.post('/checkout', checkoutBills);
router.get('/oldBills', getAllOldBills);
router.get('/done', weNeedToTalk);
router.get('/newbills/:userId', getNewbillsPaidBySpecificUser);
router.get('/oldbills/:userId', getOldbillsPaidBySpecificUser);
router.delete('/:billId', deleteBill);

export default router;
