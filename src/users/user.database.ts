import mysql from 'mysql2/promise';
import { User, UnitUser } from "./user.interface";
import bcrypt from "bcryptjs";

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'users_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const findAll = async (): Promise<UnitUser[]> => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows as UnitUser[];
};

export const findOne = async (id: string): Promise<UnitUser> => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as UnitUser[])[0];
};

export const create = async (userData: User): Promise<UnitUser | null> => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [userData.username, userData.email, hashedPassword]
    );
    
    const id = (result as any).insertId;
    return findOne(id.toString());
};

export const findByEmail = async (email: string): Promise<UnitUser | null> => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return (rows as UnitUser[])[0] || null;
};

export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
    const user = await findByEmail(email);
    if (!user) return null;

    const decryptPassword = await bcrypt.compare(supplied_password, user.password);
    return decryptPassword ? user : null;
};

export const update = async (id: string, updateValues: User): Promise<UnitUser | null> => {
    const userExists = await findOne(id);
    if (!userExists) return null;

    if (updateValues.password) {
        const salt = await bcrypt.genSalt(10);
        updateValues.password = await bcrypt.hash(updateValues.password, salt);
    }

    await pool.query(
        'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
        [updateValues.username, updateValues.email, updateValues.password, id]
    );

    return findOne(id);
};

export const remove = async (id: string): Promise<void> => {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
};