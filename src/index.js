const express = require('express');
const { v4: uuidv4 } = require('uuid');

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

    return response.status(201).json(customer);
});

app.use(verifyIfAccountExistsCPF);

app.get("/customers", (request, response) => {
    const { customer } = request;

    if (customer) {
        return response.json(customer);
    }

    return response.json(customers);
});

app.get("/statement", (request, response) => {
    const { customer } = request;

    if (!customer) {
        return response.status(400).json({ error: "Customer not found" });
    }

    return response.json(customer.statement);
});

app.listen(3333);
