# main.py
# The complete Python backend for The Living Ledger, with integrated Oracle Insights and Investment Predictions.

import os
import io
import json
import httpx
import pandas as pd
import asyncio
import numpy as np
import yfinance as yf
from scipy.stats import linregress
from typing import List, Dict
from datetime import datetime, timedelta
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- Environment & App Setup ---
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI(
    title="The Living Ledger Storyteller API (Python)",
    description="An API that converts financial transactions into Minecraft-themed storylines, provides Oracle insights, and predicts investment performance using the Gemini API."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Data Validation ---
class Transaction(BaseModel):
    description: str
    amount: float
    type: str

class TransactionWithStory(Transaction):
    id: int
    story: str
    timestamp: datetime

class InvestmentPredictionRequest(BaseModel):
    ticker_symbol: str
    days_to_predict: int = 30

class InvestmentPredictionResponse(BaseModel):
    company_name: str
    current_price: float
    prediction_text: str

# --- In-Memory Storage ---
transactions_log: List[TransactionWithStory] = []
next_transaction_id = 0

# --- 🚀 GEMINI API Logic ---
STORY_PROMPT_TEMPLATE = """
You are a financial storyteller for an app called 'The Living Ledger', which has a Minecraft theme. Your task is to take a raw bank transaction and convert it into a creative, short story statement. First, you must identify the category of the transaction. Then, map the currency to 'diamonds' and the purchase to a relevant Minecraft item or event.
--- EXAMPLES ---
Input: `Description: "UPI/AMAZON_IN/", Type: debit, Amount: 1200` -> Output: Traded 1200 diamonds with a wandering villager for rare crafting supplies.
Input: `Description: "SALARY CREDIT SEPTEMBER", Type: credit, Amount: 75000` -> Output: A massive vein of 75000 diamonds was discovered in the great mine!
Input: `Description: "Zomato", Type: debit, Amount: 350` -> Output: Spent 350 diamonds to craft a few enchanted golden apples for a quick feast.
--- YOUR TASK ---
Input: `Description: "{desc}", Type: {type}, Amount: {amount}` -> Output:
"""

INSIGHT_PROMPT_TEMPLATE = """
You are a mystical Oracle in a Minecraft-themed financial app called 'The Living Ledger'. Based on the following summary of an adventurer's recent financial activity, provide 2-3 short, encouraging, and thematic insights. Speak wisely and concisely.
--- ADVENTURER'S SUMMARY ---
{summary}
--- YOUR INSIGHTS (in JSON format: {"insights": ["Insight 1", "Insight 2"]}) ---
"""

async def call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server.")
    
    gemini_api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    async with httpx.AsyncClient(timeout=45.0) as client:
        try:
            response = await client.post(gemini_api_url, json=payload, headers={"Content-Type": "application/json"})
            response.raise_for_status()
            response_data = response.json()
            return response_data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (httpx.RequestError, KeyError, IndexError) as e:
            print(f"Error calling Gemini API: {e}")
            return "The connection to the celestial Oracle was lost..."

# --- 🔮 Oracle Insights Logic ---
def analyze_recent_transactions() -> str:
    if not transactions_log:
        return "The adventurer has not yet begun their journey. The scrolls are blank."

    recent_transactions = [tx for tx in transactions_log if tx.timestamp > datetime.utcnow() - timedelta(days=30)]
    if not recent_transactions:
        return "No quests have been logged in the past 30 days. The path is quiet."

    income = sum(tx.amount for tx in recent_transactions if tx.type == 'credit')
    expenses = sum(tx.amount for tx in recent_transactions if tx.type == 'debit')
    
    summary = f"- Total Diamonds Gained in last 30 days: {income:,.0f}\n"
    summary += f"- Total Diamonds Spent in last 30 days: {expenses:,.0f}\n"
    
    if expenses > 0:
        expense_descriptions = [tx.description.lower() for tx in recent_transactions if tx.type == 'debit']
        food_count = sum(1 for d in expense_descriptions if any(keyword in d for keyword in ["zomato", "swiggy", "food", "grocery"]))
        shopping_count = sum(1 for d in expense_descriptions if any(keyword in d for keyword in ["amazon", "flipkart", "shop"]))
        summary += f"- Logged {food_count} quests for provisions and {shopping_count} trades with villagers."

    return summary

# --- 💎 Investment Prediction Logic ---
def predict_stock_growth(hist_data: pd.DataFrame, days_to_predict: int) -> str:
    if hist_data is None or hist_data.empty or len(hist_data) < 10:
        return "Not enough historical data to forge a prediction."

    hist_data = hist_data.copy()
    hist_data['Date'] = np.arange(len(hist_data))
    
    slope, intercept, r_value, p_value, std_err = linregress(hist_data['Date'], hist_data['Close'])

    future_dates = np.arange(len(hist_data), len(hist_data) + days_to_predict)
    predicted_price = slope * future_dates[-1] + intercept
    avg_growth = slope

    return f"The Oracle predicts a value of around ${predicted_price:,.2f} in {days_to_predict} days, with an average daily growth trend of ${avg_growth:,.2f}."

# --- API Endpoints ---
@app.get("/transactions", response_model=List[TransactionWithStory])
async def get_all_transactions():
    return transactions_log

@app.post("/transaction", response_model=TransactionWithStory)
async def create_transaction(transaction: Transaction):
    global next_transaction_id
    full_prompt = STORY_PROMPT_TEMPLATE.format(
        desc=transaction.description, type=transaction.type.lower(), amount=transaction.amount
    )
    story = await call_gemini(full_prompt)
    
    new_transaction = TransactionWithStory(
        id=next_transaction_id,
        description=transaction.description, amount=transaction.amount, type=transaction.type,
        story=story, timestamp=datetime.utcnow()
    )
    
    transactions_log.insert(0, new_transaction)
    next_transaction_id += 1
    return new_transaction

@app.post("/upload_csv", response_model=List[TransactionWithStory])
async def upload_transactions_csv(file: UploadFile = File(...)):
    global next_transaction_id
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        required_columns = {'Description', 'Amount', 'Type'}
        if not required_columns.issubset(df.columns):
            raise HTTPException(status_code=400, detail=f"CSV must contain {required_columns} columns.")

        story_tasks = []
        for _, row in df.iterrows():
            transaction_data = Transaction(
                description=row['Description'], amount=float(row['Amount']), type=row['Type'].lower()
            )
            prompt = STORY_PROMPT_TEMPLATE.format(
                desc=transaction_data.description, type=transaction_data.type, amount=transaction_data.amount
            )
            story_tasks.append(call_gemini(prompt))
        
        stories = await asyncio.gather(*story_tasks)
        newly_created_transactions = []
        for (index, row), story in zip(df.iterrows(), stories):
            timestamp = pd.to_datetime(row.get('Timestamp', datetime.utcnow())).to_pydatetime()
            new_transaction = TransactionWithStory(
                id=next_transaction_id, description=row['Description'], amount=float(row['Amount']),
                type=row['Type'].lower(), story=story, timestamp=timestamp
            )
            newly_created_transactions.append(new_transaction)
            next_transaction_id += 1
        
        transactions_log.extend(newly_created_transactions)
        transactions_log.sort(key=lambda tx: tx.timestamp, reverse=True)
        return newly_created_transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

@app.get("/oracle_insights", response_model=Dict[str, List[str]])
async def get_oracle_insights():
    summary = analyze_recent_transactions()
    prompt = INSIGHT_PROMPT_TEMPLATE.format(summary=summary)
    
    try:
        response_str = await call_gemini(prompt)
        cleaned_str = response_str.replace("```json", "").replace("```", "").strip()
        insights_data = json.loads(cleaned_str)
        return insights_data
    except Exception as e:
        print(f"Error getting insights: {e}")
        return {"insights": ["The Oracle's vision is cloudy... Try again later."]}

@app.post("/predict_investment", response_model=InvestmentPredictionResponse)
async def predict_investment(request: InvestmentPredictionRequest):
    try:
        stock = yf.Ticker(request.ticker_symbol)
        info = stock.info
        hist = stock.history(period="90d")
        prediction = predict_stock_growth(hist, request.days_to_predict)

        return InvestmentPredictionResponse(
            company_name=info.get('longName', request.ticker_symbol.upper()),
            current_price=info.get('currentPrice', 0),
            prediction_text=prediction
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not find data for ticker '{request.ticker_symbol}': {e}")

@app.post("/reset")
async def reset_server_data():
    global transactions_log, next_transaction_id
    transactions_log = []
    next_transaction_id = 0
    return {"message": "Server data has been reset."}

