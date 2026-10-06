# Backend/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
from sqlalchemy import text, inspect # 🔴 Inspect import kiya

from db.database import engine, Base, SessionLocal
from db import models
from core.security import get_password_hash
from api.routes import auth, clients, payments, dashboard, settings

# AUTOMATION SCHEDULER IMPORTS
from apscheduler.schedulers.background import BackgroundScheduler
from core.automation import run_daily_reminders

# Base.metadata.create_all ko safely handle karne ke liye
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Schema creation issue (often ignorable): {e}")

app = FastAPI(title="IntoPilot Secure API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Image Uploads Directory Create & Mount
os.makedirs("uploads/receipts", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def startup_seed_db():
    db = SessionLocal()
    print("🚀 Running Database Seed & Migration Check...")
    try:
        # 1. 🔴 SAFE MIGRATION CHECK (Cross-Database) 🔴
        with engine.connect() as connection:
            # Table aur column names nikalne ke liye cross-DB tareeka
            inspector = inspect(engine)

            # --- PROJECTS TABLE ---
            if inspector.has_table("projects"):
                cols_proj = [col["name"] for col in inspector.get_columns("projects")]
                if "location" not in cols_proj:
                    connection.execute(text("ALTER TABLE projects ADD COLUMN location VARCHAR DEFAULT 'India';"))
                if "plotPrefix" not in cols_proj:
                    connection.execute(text("ALTER TABLE projects ADD COLUMN plotPrefix VARCHAR DEFAULT 'P';"))
                if "targetClients" not in cols_proj:
                    connection.execute(text("ALTER TABLE projects ADD COLUMN targetClients INTEGER DEFAULT 100;"))

            # --- CLIENTS TABLE ---
            if inspector.has_table("clients"):
                cols_client = [col["name"] for col in inspector.get_columns("clients")]
                if "email" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN email VARCHAR;"))
                if "pan_card" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN pan_card VARCHAR;"))
                if "aadhaar_card" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN aadhaar_card VARCHAR;"))
                if "address" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN address VARCHAR;"))
                if "national_id" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN national_id VARCHAR;"))
                if "pan_doc_url" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN pan_doc_url VARCHAR;"))
                if "aadhaar_doc_url" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN aadhaar_doc_url VARCHAR;"))
                if "national_id_doc_url" not in cols_client:
                    connection.execute(text("ALTER TABLE clients ADD COLUMN national_id_doc_url VARCHAR;"))

            # --- PLOTS TABLE ---
            if inspector.has_table("plots"):
                cols_plot = [col["name"] for col in inspector.get_columns("plots")]
                if "due_date" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN due_date DATE;"))
                if "survey_number" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN survey_number VARCHAR;"))
                if "facing" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN facing VARCHAR;"))
                if "agreement_no" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN agreement_no VARCHAR;"))
                if "registration_status" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN registration_status VARCHAR DEFAULT 'Pending';"))
                if "commission_per_sqft" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN commission_per_sqft FLOAT DEFAULT 0.0;"))
                if "total_commission" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN total_commission FLOAT DEFAULT 0.0;"))
                if "commission_paid_amount" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN commission_paid_amount FLOAT DEFAULT 0.0;"))
                if "commission_balance" not in cols_plot:
                    connection.execute(text("ALTER TABLE plots ADD COLUMN commission_balance FLOAT DEFAULT 0.0;"))
                if "assigned_staff_id" not in cols_plot:
                    # Foreign key add directly via alter isn't always easy, safely ignored if manual migration needed
                    try:
                        connection.execute(text("ALTER TABLE plots ADD COLUMN assigned_staff_id INTEGER;"))
                    except:
                        pass

            # --- PAYMENTS TABLE ---
            if inspector.has_table("payments"):
                cols_pay = [col["name"] for col in inspector.get_columns("payments")]
                if "bank_name" not in cols_pay:
                    connection.execute(text("ALTER TABLE payments ADD COLUMN bank_name VARCHAR;"))
                if "received_date" not in cols_pay:
                    connection.execute(text("ALTER TABLE payments ADD COLUMN received_date DATE;"))
                if "booked_by" not in cols_pay:
                    connection.execute(text("ALTER TABLE payments ADD COLUMN booked_by VARCHAR;"))

            # --- STAFF TABLE ---
            if inspector.has_table("staff"):
                cols_staff = [col["name"] for col in inspector.get_columns("staff")]
                if "email" not in cols_staff:
                    connection.execute(text("ALTER TABLE staff ADD COLUMN email VARCHAR DEFAULT 'staff@intopilot.in';"))

            # --- BUSINESS PROFILES TABLE ---
            if inspector.has_table("business_profiles"):
                cols_profile = [col["name"] for col in inspector.get_columns("business_profiles")]
                if "logo_url" not in cols_profile:
                    connection.execute(text("ALTER TABLE business_profiles ADD COLUMN logo_url VARCHAR;"))

            connection.commit()
        print("🛡️ All Tables Safely Verified & Migrated!")

        # 2. Default Admin User
        user = db.query(models.User).filter(models.User.email == "aosaf@greenvalleygroup.com").first()
        if not user:
            hashed_pw = get_password_hash("aosaf@123")
            # Yaha mistake thi "aosaf@greenvalleygroup" likha tha pehle bina .com ke
            new_user = models.User(email="aosaf@greenvalleygroup.com", hashed_password=hashed_pw)
            db.add(new_user)
            db.commit()
            print("✅ Default Admin Created!")

        # 3. Default Profile
        profile = db.query(models.BusinessProfile).first()
        if not profile:
            profile = models.BusinessProfile(owner_name="Ramesh Mehta", business_name="AscentiQ AI Group")
            db.add(profile)
            db.commit()

        # 4. Default Staff
        staff = db.query(models.Staff).first()
        if not staff:
            default_staff = [
                models.Staff(name="Anil Kumar Nair", role="Recovery Officer", phone="+91 98470 11223", email="anil@intopilot.in"),
                models.Staff(name="Priya Subramaniam", role="Senior Sales Manager", phone="+91 98470 55667", email="priya@intopilot.in"),
                models.Staff(name="Deepak Menon", role="Recovery Officer", phone="+91 98470 99881", email="deepak@intopilot.in")
            ]
            db.add_all(default_staff)
            db.commit()

        # 5. Default Integrations
        integrations = db.query(models.Integration).first()
        if not integrations:
            defaults_int = [
                {"name": "Zoho Books", "description": "Sync invoices & payments", "icon": "💾", "is_connected": 0},
                {"name": "Tally ERP", "description": "Auto-import ledgers & overdue bills", "icon": "💳", "is_connected": 0},
                {"name": "Razorpay", "description": "Collect installments online & reconcile", "icon": "⚡", "is_connected": 0},
                {"name": "WhatsApp Business API", "description": "Send reminders & payment links", "icon": "📱", "is_connected": 1},
                {"name": "Retell AI", "description": "Bilingual voice agent for overdue calls", "icon": "🔊", "is_connected": 1},
                {"name": "SMS Gateway (MSG91)", "description": "Automated SMS reminders", "icon": "💬", "is_connected": 1},
                {"name": "Salesforce", "description": "CRM & opportunity sync", "icon": "☁️", "is_connected": 0},
                {"name": "Custom Webhook", "description": "Connect any external system", "icon": "🔗", "is_connected": 0},
            ]
            for d in defaults_int:
                db.add(models.Integration(**d))
            db.commit()

        # 6. Default Templates
        templates = db.query(models.MessageTemplate).first()
        if not templates:
            defaults_tmpl = [
                {"template_key": "upcoming", "title": "Upcoming Installment Reminder", "subtitle": "Sent 3 days before the due date", "icon": "🔔", "bg_color": "var(--blue-bg)", "text_color": "var(--blue)", "subject": "Upcoming Installment - {{invoiceNumber}}", "body": "Dear {{clientName}},\n\nThis is a friendly reminder that your installment of {{installmentAmount}} for plot {{plotNumber}} is due on {{dueDate}}.\n\nOutstanding Balance: {{outstandingBalance}}\n\nPlease make the payment at your earliest convenience.\n{{paymentLink}}\n\n- {{vendorName}}"},
                {"template_key": "sms", "title": "SMS Reminder (Day 11)", "subtitle": "Sent automatically 11 days after the due date", "icon": "💬", "bg_color": "var(--orange-bg)", "text_color": "var(--orange)", "subject": "Payment Reminder - {{invoiceNumber}}", "body": "Dear {{clientName}}, your installment of {{installmentAmount}} for plot {{plotNumber}} was due on {{dueDate}} and remains unpaid. Outstanding balance: {{outstandingBalance}}. Pay now: {{paymentLink}} - {{vendorName}}"},
                {"template_key": "whatsapp", "title": "WhatsApp Reminder (Day 13)", "subtitle": "Sent automatically 13 days after the due date", "icon": "📱", "bg_color": "var(--orange-bg)", "text_color": "var(--orange)", "subject": "Payment Reminder - {{invoiceNumber}}", "body": "Hi {{clientName}}, this is a reminder from {{vendorName}} that your plot {{plotNumber}} installment of {{installmentAmount}} is still pending.\n\nDue Date: {{dueDate}}\nOutstanding Balance: {{outstandingBalance}}\n\nPlease complete your payment here: {{paymentLink}}\n\nIf you have already paid, kindly ignore this message."},
                {"template_key": "escalate", "title": "Staff Escalation Alert (Day 16+)", "subtitle": "Internal alert sent to the assigned recovery officer", "icon": "✋", "bg_color": "var(--red-bg)", "text_color": "var(--red)", "subject": "Escalation Alert - {{invoiceNumber}}", "body": "Case escalated: {{clientName}} (Plot {{plotNumber}}) has an overdue installment of {{installmentAmount}}, due {{dueDate}}. Outstanding balance: {{outstandingBalance}}.\n\nPlease contact the client directly.\nAssigned to: {{staffName}} ({{staffPhone}})"}
            ]
            for d in defaults_tmpl:
                db.add(models.MessageTemplate(**d))
            db.commit()

        # 7. Default Placeholders
        placeholders = db.query(models.PlaceholderRef).first()
        if not placeholders:
            default_phs = [
                {"ph_key": "clientName", "description": "Client Name", "sample_value": "Rajesh Kumar"},
                {"ph_key": "plotNumber", "description": "Plot Number", "sample_value": "A-101"},
                {"ph_key": "invoiceNumber", "description": "Invoice Number", "sample_value": "A-101-INV03"},
                {"ph_key": "installmentAmount", "description": "Installment Amount", "sample_value": "₹1,50,000"},
                {"ph_key": "dueDate", "description": "Due Date", "sample_value": "15 Jul 2026"},
                {"ph_key": "outstandingBalance", "description": "Outstanding Balance", "sample_value": "₹75,000"},
                {"ph_key": "vendorName", "description": "Business Name", "sample_value": "AscentiQ AI Group"},
                {"ph_key": "paymentLink", "description": "Payment Link", "sample_value": "https://pay.intopilot.in/rc-00001"},
                {"ph_key": "staffName", "description": "Assigned Staff Name", "sample_value": "Anil Kumar Nair"},
                {"ph_key": "staffPhone", "description": "Assigned Staff Phone", "sample_value": "+91 98470 11223"}
            ]
            for p in default_phs:
                db.add(models.PlaceholderRef(**p))
            db.commit()
            print("✅ Default Placeholders Seeded!")

    except Exception as e:
        print(f"🔥 Startup DB Seed Error: {e}")
    finally:
        db.close()

    # SCHEDULER START
    try:
        print("⏰ Starting Background Scheduler (Runs on 18th of every month at 11:50 PM)...")
        scheduler = BackgroundScheduler()
        scheduler.add_job(run_daily_reminders, 'cron', day=18, hour=23, minute=50)
        scheduler.start()
    except Exception as e:
        print(f"⚠️ Scheduler start error: {e}")

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(clients.router, prefix="/api/clients", tags=["Clients"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard Data"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
