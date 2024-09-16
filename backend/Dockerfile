# Use a lightweight base image with Python
FROM python:3.10-slim


# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Install dependencies
WORKDIR /app
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Run the application
CMD ["flask", "run"]
