import mongoose, { Model, Document } from 'mongoose';
import { EmbedError } from './../embeds/Error';
import { getPlayerStats } from './../services/pubg';

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  pubgNickname: {
    type: String,
    required: true,
    unique: true,
  },
  kd: {
    type: Number,
    sparce: true,
  },
  avgDamage: {
    type: Number,
    sparce: true,
  },
  winRatio: {
    type: Number,
    sparce: true,
  },
  bestRank: {
    type: String,
    sparce: true,
  },
  roundsPlayed: {
    type: Number,
    sparce: true,
  },
});

interface UserDocument extends Document {
  discordId: string;
  pubgNickname: string;
  kd?: number | null;
  avgDamage?: number | null;
  winRatio?: number | null;
  roundsPlayed?: number | null;
  bestRank?: string | null;
  createdAt: string;
  updatedAt: string;
}

type LinkProps = {
  discordId: string;
  pubgNickname: string;
};

interface UserModel extends Model<UserDocument> {
  linkPubgAccount: (props: LinkProps) => Promise<UserDocument>;
  updatePubgStats: (props: { discordId: string }) => Promise<UserDocument>;
}

UserSchema.set('timestamps', true);

// instance
UserSchema.methods = {};

// model
UserSchema.statics = {
  async linkPubgAccount({ discordId, pubgNickname }: LinkProps) {
    // find in DB
    const userWithNick: UserDocument = await this.findOne({ pubgNickname });
    if (userWithNick) {
      throw new EmbedError(
        `Utilizador <@${userWithNick.discordId}> já està ligado a esta conta de pubg **${pubgNickname}**, se é a tua conta entre em contacto com a administração.`,
      );
    }

    // get player stats from pubg api
    const { kd, avgDamage, bestRank, winRatio, roundsPlayed } = await getPlayerStats(pubgNickname);
    const newPlayer = await User.findOneAndUpdate(
      { discordId },
      { discordId, pubgNickname, kd, avgDamage, bestRank, winRatio, roundsPlayed },
      {
        new: true,
        upsert: true,
      },
    );
    return newPlayer;
  },
  async updatePubgStats({ discordId }: LinkProps) {
    // find in DB
    const user: UserDocument = await this.findOne({ discordId });
    if (!user) {
      throw new EmbedError(
        `<@${discordId}> tens de ligar a tua conta do Discord ao PUBG, usa o comando \`/link NICK_DO_PUBG\`.`,
      );
    }

    // get player stats from pubg api and update
    const { kd, avgDamage, bestRank, winRatio, roundsPlayed } = await getPlayerStats(user.pubgNickname);
    user.kd = kd;
    user.avgDamage = avgDamage;
    user.bestRank = bestRank;
    user.winRatio = winRatio;
    user.roundsPlayed = roundsPlayed;
    await user.save();
    return user;
  },
};

const User = mongoose.model<UserDocument, UserModel>('User', UserSchema);

export default User;
