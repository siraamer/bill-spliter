import mongoose, { Schema, Document } from 'mongoose';

import bcrypt from 'bcrypt';

export interface IUser {
  name: string;
  email: string;
  password: string;
  credit: number;
  debt: number;
  billsHePaid: Document[];
  passwordChangedAt: Date;
}

export interface IUserModel extends IUser, Document {}

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordChangedAt: Date,
    debt: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },

    billsHePaid: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bill',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// userSchema.pre(/^find/, function (next) {
//   this.populate({ path: 'billsHePaid', select: 'done' });
//   next();
// });

userSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  next();
});

export default mongoose.model<IUserModel>('User', userSchema);
