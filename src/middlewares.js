const verifyIfAccountExistsCPF = (request, response, next) => {
    const { cpf } = request.headers;

    const customer = request.customers.find(customer => customer.cpf === cpf);

    request.customer = customer;

    return next();
}

module.exports = { 
    verifyIfAccountExistsCPF 
}
