import mongoose from 'mongoose'
import crypto from 'crypto'

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    language: {
      type: String,
      required: true
    },
    codeHash: {
      type: String
    },
    output: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

generationSchema.index({ createdAt: -1 })

generationSchema.statics.hashCode = function (code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

generationSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v
    return ret
  }
})

const Generation = mongoose.model('Generation', generationSchema)

export default Generation
