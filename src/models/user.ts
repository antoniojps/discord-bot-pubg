import mongoose, { Model, Document } from 'mongoose';
import { EmbedError } from './../embeds/Error';
import { getPlayerStats, Stats } from './../services/pubg';

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
  stats: {
    type: {
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
    },
    sparce: true,
  },
});

export interface UserPartial {
  discordId: string;
  pubgNickname: string;
  stats?: Stats | null;
}
export interface UserDocument extends UserPartial, Document {
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
        `<@${userWithNick.discordId}> já està ligado a esta conta de pubg **${pubgNickname}**. Se pretendes atualizar usa \`/update\``,
      );
    }

    // get player stats from pubg api
    const stats = await getPlayerStats(pubgNickname);
    const newPlayer = await User.findOneAndUpdate(
      { discordId },
      { discordId, pubgNickname, stats },
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
    const stats = await getPlayerStats(user.pubgNickname);
    user.stats = stats;
    await user.save();
    return user;
  },
};

const User = mongoose.model<UserDocument, UserModel>('User', UserSchema);

export default User;
