const spicedPg = require("spiced-pg");
let secrets;
let dbUrl;
if (process.env.NODE_ENV === "production") {
    secrets = process.env;
    dbUrl = secrets.DATABASE_URL;
} else {
    secrets = require("./secrets.json");
    dbUrl = `postgres:${secrets.dbUser}:${secrets.dbPassword}@localhost:5433/danceCalendar`;
}
const db = spicedPg(dbUrl);
var bcrypt = require("bcryptjs");

exports.getFacebookUser = function(id) {
    return db.query(`SELECT * FROM users WHERE id = $1`, [id]).then(results => {
        return results.rows[0];
    });
};

exports.findOrCreateFacebookUser = function(id, name) {
    return exports.getFacebookUser(id).then(user => {
        if (user) {
            return user;
        }
        return db
            .query(
                `
                  INSERT INTO users
                  (id, name)
                  VALUES ($1, $2)
                  returning *;
                  `,
                [id, name]
            )
            .then(function(results) {
                return results.rows;
            });
    });
};

exports.submitEvent = function(
    title,
    address,
    starthour,
    endhour,
    date0,
    date1,
    date2,
    date3,
    date4,
    date5,
    date6,
    repeats,
    description,
    cost,
    price
) {
    console.log("terminator", date0);
    return db
        .query(
            `
        INSERT INTO calendar
        (   title,
            address,
            starthour,
            endhour,
           date0,
            date1,
            date2,
            date3,
            date4,
            date5,
            date6,
            repeats,
            description,
            cost,
            price
)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        returning *;
        `,
            [
                title,
                address,
                starthour,
                endhour,
                date0,
                date1,
                date2,
                date3,
                date4,
                date5,
                date6,
                repeats,
                description,
                cost,
                price
            ]
        )
        .then(function(results) {
            console.log("im back");
            return results.rows;
        });
};

exports.getEventDetails = function(id) {
    console.log("do I have the id here?", id);
    return db
        .query(`SELECT * FROM calendar WHERE id = $1`, [id])
        .then(results => {
            return results.rows[0];
        });
};

exports.getEvents = function() {
    return db
        .query(
            `SELECT *
        FROM calendar
        ORDER BY id DESC
        ;`
        )
        .then(results => {
            return results.rows;
        });
};

exports.getEventsBetter = function(from, to) {
    return db
        .query(
            `SELECT *
        FROM calendar
        WHERE date0 >= $1 AND date0 < $2 OR date1 >= $1 AND date1 < $2 OR date2 >= $1 AND date2 < $2 OR date3 >= $1 AND date3 < $2 OR date4 >= $1 AND date4 < $2 OR date5 >= $1 AND date5 < $2 OR date6 >= $1 AND date6 < $2
        ;`,
            [from, to]
        )
        .then(results => {
            console.log("where are u event", results.rows);
            return results.rows;
        });
};
