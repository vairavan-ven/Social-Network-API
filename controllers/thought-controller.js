const { ObjectId } = require('mongoose').Types;
const { User, Thought, Reaction } = require('../models');

module.exports = {
  // GET all thoughts
  async getThoughts(req, res) {
    try {
      const thoughts = await Thought.find();
      res.json(thoughts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // GET a single thought by its _id
  async getSingleThought(req, res) {
    try {
      const thought = await Thought.findById(req.params.thoughtId).populate('reactions');
      
      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // POST to create a new thought
  async createThought(req, res) {
    const { thoughtText, username } = req.body;
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      const thought = await Thought.create({ thoughtText, username });

      // Push the created thought's _id to the associated user's thoughts array field
      user.thoughts.push(thought._id);
      await user.save();

      res.status(201).json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // PUT to update a thought by its _id
  async updateThought(req, res) {
    const { thoughtText } = req.body;
    try {
      const thought = await Thought.findByIdAndUpdate(
        req.params.thoughtId,
        { thoughtText },
        { new: true }
      );

      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // DELETE to remove a thought by its _id
  async deleteThought(req, res) {
    try {
      const thought = await Thought.findByIdAndRemove(req.params.thoughtId);

      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      // Remove the thought from the associated user's thoughts array field
      const user = await User.findByIdAndUpdate(
        thought.username,
        { $pull: { thoughts: req.params.thoughtId } },
        { new: true }
      );

      res.json({ message: 'Thought successfully deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // POST to create a reaction stored in a single thought's reactions array field
  async createReaction(req, res) {
    const { reactionBody, username } = req.body;
    try {
      const thought = await Thought.findByIdAndUpdate(
        req.params.thoughtId,
        { $push: { reactions: { reactionBody, username } } },
        { new: true }
      );

      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      res.status(201).json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // DELETE to pull and remove a reaction by the reaction's reactionId value
  async deleteReaction(req, res) {
    try {
      const thought = await Thought.findByIdAndUpdate(
        req.params.thoughtId,
        { $pull: { reactions: { reactionId: req.params.reactionId } } },
        { new: true }
      );

      if (!thought) {
        return res.status(404).json({ message: 'No thought with that ID' });
      }

      res.json(thought);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
