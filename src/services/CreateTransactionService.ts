import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let categoryFound = await categoriesRepository.findOne({
      where: { title: category },
    });

    const { income, outcome } = await transactionRepository.getBalance();
    if (type === 'outcome') {
      const newTotal = outcome + value;

      if (newTotal > income) {
        throw new AppError('Total of outcome is mast be the income');
      }
    }

    if (!categoryFound) {
      categoryFound = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryFound);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryFound,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
