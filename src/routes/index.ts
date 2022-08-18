import billRoutes from './billRoutes';
import userRoutes from './userRoutes';

import { Application } from 'express';

const MountRoutes = (router: Application) => {
  router.use('/api/v1/users', userRoutes);
  router.use('/api/v1/bills', billRoutes);
};

export default MountRoutes;
