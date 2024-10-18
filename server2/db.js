// This code was assisted by ChatGPT

const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.init();
  }

  // Initialize the database connection and ensure the patient table exists
  async init() {
    try {
      this.connection = await mysql.createConnection({
        host: 'mysql-lab5origin2-26158.nodechef.com',            // Database host
        user: 'ncuser_3406',                 // Replace with your database username
        password: 'TqlfM2QROWbjLupGq5tVtnAGbV86Qg',         // Replace with your database password
        database: 'lab5origin2',      // Database name
        port: 2458,  
        multipleStatements: false      // Allow execution of multiple SQL statements
      });
      console.log('Connected to the MySQL database.');

      // SQL query to create the patient table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS patient (
          patientid INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          dateOfBirth DATETIME
        ) ENGINE=InnoDB;
      `;

      await this.connection.execute(createTableQuery);
      console.log('Patient table is ready.');
    } catch (err) {
      console.error('Error connecting to the database:', err);
      process.exit(1); // Exit the application if the database connection fails
    }
  }

  // Method to execute a given SQL query
  async executeQuery(query) {
    try {
      const [results] = await this.connection.query(query);
      return results;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Database;
