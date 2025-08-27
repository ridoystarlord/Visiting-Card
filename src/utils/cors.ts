const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5001",
  "http://localhost:6001",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Your Request origin is not allowed"));
    }
  },
  methods: "GET,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
};

export default corsOptions;
