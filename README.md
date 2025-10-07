cd backend 
pip install --upgrade pip setuptools wheel 
pip install -r requirements.txt
pip install --upgrade fastapi pydantic
python -m app.main

cd frontend
npm install
npm install react-scripts@latest
npm start
