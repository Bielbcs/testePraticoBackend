'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class project extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  project.init({
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    title: DataTypes.STRING,
    zip_code: DataTypes.NUMBER,
    cost: DataTypes.NUMBER,
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deadline: DataTypes.DATE,
    username: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'project',
    timestamps: true,
  });
  return project;
};