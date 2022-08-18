import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IBill {
  title: string;
  price: number;
  paidBy: Document;
  shareWith: Document[];
  done: boolean;
  find: Array<boolean>['find'];
}

export interface IBillModel extends IBill, Document {}

const billSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shareWith: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    done: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

billSchema.pre(/^find/, function (next) {
  this.populate({ path: 'shareWith', select: 'name' });
  next();
});

billSchema.pre(/^find/, function (next) {
  this.populate({ path: 'paidBy', select: 'name _id' });
  next();
});

export default mongoose.model<IBillModel>('Bill', billSchema);
