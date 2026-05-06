require("dotenv").config();
const app = require("./src/app");
const { startHolidayFlashSaleCron } = require("./src/controllers/flash-sale.controller");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

startHolidayFlashSaleCron();