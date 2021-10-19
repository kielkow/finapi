const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { getBalance } = require('./functions');
const { verifyIfAccountExistsCPF } = require('./middlewares');

const app = express();

app.use(express.json());

const customers = [];
app.request.customers = customers;

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some(
        customer => customer.cpf === cpf
    );

    if (customerAlreadyExists) {
        return response.status(400).json({ error: "Customer already exists!" });
    }

    const customer = {
        cpf,
        name,
        id: uuidv4(),
        statement: []
    };

    customers.push(customer);

    return response.status(201).send();
});

app.get("/customers", (request, response) => {
    if (request.headers.cpf) {
        const customer = customers.find(c => c.cpf === request.headers.cpf);

        if (!customer) {
            return response.status(400).json({ error: "Customer not found" });
        }

        return response.json(customer);
    }

    return response.json(customers);
});

app.use(verifyIfAccountExistsCPF);

app.get("/statement", (request, response) => {
    const { customer } = request;

    return response.json(customer.statement);
});

app.post("/deposit", (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post("/withdraw", (request, response) => {
    const { customer } = request;
    const { amount } = request.body;

    const balance = getBalance(customer.statement);

    if (balance < amount) {
        return response.status(400).json({
            error: "Insufficient funds!"
        });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.get("/statement/date", (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        (statement) =>
            statement.created_at.toDateString() ===
            new Date(dateFormat).toDateString()
    );

    return response.json(statement);
});

app.put("/account", (request, response) => {
    const { customer } = request;
    const { name } = request.body;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account", (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.delete("/account", (request, response) => {
    const { customer } = request;

    const index = customers.indexOf(customer);

    customers.splice(index, 1);

    return response.status(200).json(customers);
});

app.listen(3333);
