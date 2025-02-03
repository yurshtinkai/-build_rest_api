import express, { Router, Request, Response, NextFunction } from "express";
import { UnitUser } from "./user.interface";
import { StatusCodes } from "http-status-codes";
import * as database from "./user.database";

const asyncHandler = (fn: Function) => 
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export const userRouter = Router();

userRouter.get("/users", asyncHandler(async (req: Request, res: Response) => {
    const allUsers: UnitUser[] = await database.findAll();
    if (!allUsers) {
        res.status(StatusCodes.NOT_FOUND).json({ msg: 'No users at this time...' });
        return;
    }
    res.status(StatusCodes.OK).json({ total_user: allUsers.length, allUsers });
}));

userRouter.get("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const user: UnitUser = await database.findOne(req.params.id);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found!' });
    }
    return res.status(StatusCodes.OK).json(user);
}));

userRouter.post("/register", asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide all the required parameters..' });
    }
    const user = await database.findByEmail(email);
    if (user) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'This email has already been registered..' });
    }
    const newUser = await database.create(req.body);
    return res.status(StatusCodes.CREATED).json(newUser);
}));

userRouter.post("/login", asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Please provide all the required parameters.." });
    }
    const user = await database.findByEmail(email);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "No user exists with the email provided.." });
    }
    const comparePassword = await database.comparePassword(email, password);
    if (!comparePassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Incorrect Password!' });
    }
    return res.status(StatusCodes.OK).json(user);
}));

userRouter.put("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const getUser = await database.findOne(req.params.id);
    if (!username || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide all the required parameters..' });
    }
    if (!getUser) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: `No user with id ${req.params.id}` });
    }
    const updateUser = await database.update(req.params.id, req.body);
    return res.status(StatusCodes.OK).json(updateUser);
}));

userRouter.delete("/user/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await database.findOne(id);
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: 'User does not exist' });
    }
    await database.remove(id);
    return res.status(StatusCodes.OK).json({ msg: "User deleted" });
}));