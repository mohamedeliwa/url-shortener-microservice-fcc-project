const mongoose = require("mongoose");
const dns = require("dns");
// Creating a mongoose Schema, to get functionality of midllewares, also to be able to create static methods on schemas
// first argument is the schema itself, the second argument is for options like timestamps
const urlSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 16,
      unique: true,
      validate: [
        {
          validator: value => {
            const regex = /^https?:\/\/([a-z]+\.)?[a-zA-Z\-]+\.[a-z]+/g;
            return regex.test(value);
          },
          message: "Regular Expression Error!"
         },
        {
          // returning a promise to make the validator function asynchronous and waits for the dns.lookup function
          validator: value => new Promise((resolve, reject) => {
              const regex = /^https?:\/\/www\.[a-zA-Z\-]+\.[a-z]+/g;
              const domain = value.match(regex)[0].replace(/^https?:\/\//g, "");
              console.log( domain, typeof domain);
              dns.lookup(domain, (error, address, family) => {
                console.log(domain);
                if (error) reject(new Error("DNS LookUp Error!"));
                resolve()
              });
            }),
          message: "DNS LookUp Error!"
        }
      ]
    },
    shortAddess: {
      type: String
    }
  },
  {
    // each task will be created with two additional fields
    // first when it's created, second when it's modified
    timestamps: true
  }
);

// Defining toJSON() method that returns only public accessible URL informations
// toJSON() is a built in method that runs before JSON.stringfy() runs.
// we redefined it to modify our URL object before stringfying it to JSON and sending it in our response.
urlSchema.methods.toJSON = function() {
  const url = this;
  // creating a copy of url object, so we can modify it without mutating the original user object.
  const urlObject = url.toObject();

  delete urlObject.createdAt;
  delete urlObject.updatedAt;
  delete urlObject.__v;
  delete urlObject._id;

  return urlObject;
};

// setting a middleware to urlSchema, using pre to do something before a specific event
// we use function statement definition not an arrow function, we need it to bind "this" key word.
// generating short url for each valid url before saving
urlSchema.pre("save", function(next) {
  const url = this;
  url.shortAddess = url._id.toString();
  next();
});

/**
 * Creating a Url model.
 * Each task inserted in the db should follow that model specifications
 */
const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
