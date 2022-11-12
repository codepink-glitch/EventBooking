db.createUser(
    {
        user: "EventsAdmin",
        pwd: "EventsAdminPassword",
        roles: [
            {
                role: "readWrite",
                db: "events"
            }
        ]
    }
);