const { Sequelize, DataTypes } = require("sequelize");
const UserModel = require("./models/User");
const VideoModel = require("./models/Video");
const VideoLikeModel = require("./models/VideoLike");
const CommentModel = require("./models/Comment");
const SubscriptionModel = require("./models/Subscription");

const sequelize = new Sequelize(process.env.POSTGRES_URI, { logging: false });
(async () => await sequelize.sync())();

const User = UserModel(sequelize, DataTypes);
const Video = VideoModel(sequelize, DataTypes);
const VideoLike = VideoLikeModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Subscription = SubscriptionModel(sequelize, DataTypes);

// video - user association
Video.belongsTo(User, { foreignKey: "userId" });

// likes association
User.belongsToMany(Video, { through: VideoLike, foreignKey: "userId" });
Video.belongsToMany(User, { through: VideoLike, foreignKey: "videoId" });

// comments association
User.hasMany(Comment, {
	foreignKey: "userId"
});
Video.hasMany(Comment, {
	foreignKey: "videoId"
});

// subscription association
User.hasMany(Subscription, {
	foreignKey: 'subscribeTo'
})

module.exports = {
	User,
	Video,
	VideoLike,
	Comment,
	Subscription
};
