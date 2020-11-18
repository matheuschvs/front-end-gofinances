import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  const formatValue = (value: number): string => {
    let string = value.toString();
    string = string.replace(/^/, 'R$ ');
    if (value >= 0 && value <= 999) {
      string = string.replace(/(\d+)$/, '$1,00');
    } else if (value >= 1000 && value <= 999999) {
      string = string.replace(/(\d+)(\d{3})$/, '$1.$2,00');
    }
    return string;
  };

  const formatDate = (date: Date): string =>
    Intl.DateTimeFormat('pt-BR').format(new Date(date));

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<Response>('/transactions');

      const transactionsArray = response.data.transactions;
      const balanceObject = response.data.balance;

      const newTransactions = transactionsArray.map(
        (transaction: Transaction) => {
          const formattedValue = formatValue(transaction.value);
          const formattedDate = formatDate(transaction.created_at);
          return {
            id: transaction.id,
            title: transaction.title,
            value: transaction.value,
            formattedValue,
            formattedDate,
            type: transaction.type,
            category: transaction.category,
            created_at: transaction.created_at,
          } as Transaction;
        },
      );

      const formattedIncome = formatValue(Number(balanceObject.income));
      const formattedOutcome = formatValue(Number(balanceObject.outcome));
      const formattedTotal = formatValue(Number(balanceObject.total));

      const newBalance = {
        income: formattedIncome,
        outcome: formattedOutcome,
        total: formattedTotal,
      };

      setBalance(newBalance);
      setTransactions(newTransactions);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.type === 'outcome'
                      ? `- ${transaction.formattedValue}`
                      : transaction.formattedValue}
                  </td>
                  <td>{transaction.category?.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
