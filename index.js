// mongoose & mongodb checkpoint
// connects to mongodb atlas and runs the basic mongoose operations

require("dotenv").config();
const mongoose = require("mongoose");

// person schema: name is required, age is a number, favoriteFoods is a list of strings
const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: Number,
  favoriteFoods: [String],
});

// model built from the schema, it maps to the "people" collection
const Person = mongoose.model("Person", personSchema);

// connect to the database using the uri stored in .env
async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected to mongodb atlas");
}

// create one person and save it
async function createAndSavePerson() {
  const person = new Person({
    name: "Mary",
    age: 25,
    favoriteFoods: ["pizza", "burritos"],
  });
  const data = await person.save();
  console.log("saved person:", data);
  return data;
}

// create many people at once with model.create()
async function createManyPeople(arrayOfPeople) {
  const people = await Person.create(arrayOfPeople);
  console.log("created people:", people.length);
  return people;
}

// find all people with a given name
async function findPeopleByName(name) {
  const people = await Person.find({ name: name });
  console.log(`people named ${name}:`, people);
  return people;
}

// find one person who likes a given food
async function findOneByFood(food) {
  const person = await Person.findOne({ favoriteFoods: food });
  console.log(`one person who likes ${food}:`, person);
  return person;
}

// find one person by their _id
async function findPersonById(personId) {
  const person = await Person.findById(personId);
  console.log("person found by id:", person);
  return person;
}

// find a person, add "hamburger" to favoriteFoods, then save
async function addHamburgerToFoods(personId) {
  const person = await Person.findById(personId);
  if (!person) {
    console.log("no person with this id");
    return null;
  }
  person.favoriteFoods.push("hamburger");
  const updated = await person.save();
  console.log("updated favorite foods:", updated.favoriteFoods);
  return updated;
}

// find a person by name and set their age to 20, return the updated document
async function setAgeTo20(personName) {
  const updated = await Person.findOneAndUpdate(
    { name: personName },
    { age: 20 },
    { new: true }
  );
  console.log("updated age:", updated);
  return updated;
}

// delete one person by _id and return the removed document
async function removePersonById(personId) {
  // findByIdAndRemove is removed in mongoose 8, findByIdAndDelete does the same job
  const removed = await Person.findByIdAndDelete(personId);
  console.log("removed person:", removed);
  return removed;
}

// delete all people named "Mary"
async function removeAllMarys() {
  // model.remove() is removed in mongoose 8, deleteMany does the same job
  const result = await Person.deleteMany({ name: "Mary" });
  console.log("deleted count:", result.deletedCount);
  return result;
}

// find people who like burritos, sort by name, limit to 2, hide their age
async function findBurritoLovers() {
  const people = await Person.find({ favoriteFoods: "burritos" })
    .sort({ name: 1 })
    .limit(2)
    .select({ age: 0 })
    .exec();
  console.log("burrito lovers:", people);
  return people;
}

async function main() {
  try {
    await connectDB();

    const first = await createAndSavePerson();
    await createManyPeople([
      { name: "John", age: 40, favoriteFoods: ["burritos", "salad"] },
      { name: "Sara", age: 17, favoriteFoods: ["sushi"] },
      { name: "Mary", age: 33, favoriteFoods: ["burritos"] },
    ]);

    await findPeopleByName("John");
    await findOneByFood("sushi");
    await findPersonById(first._id);
    await addHamburgerToFoods(first._id);
    await setAgeTo20("John");
    await findBurritoLovers();
    await removePersonById(first._id);
    await removeAllMarys();
  } catch (err) {
    console.error("error:", err.message);
  } finally {
    await mongoose.connection.close();
    console.log("connection closed");
  }
}

main();
