from sambanova import SambaNova
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def _get_sambanova_client():
	api_key = os.getenv("SAMBANOVA_API_KEY")
	if not api_key:
		raise EnvironmentError("SAMBANOVA_API_KEY is not set. Set it in your environment or .env file.")
	base_url = os.getenv("SAMBANOVA_BASE_URL", "https://api.sambanova.ai/v1")
	return SambaNova(api_key=api_key, base_url=base_url)

def get_ai_recommendations(incomes, expenses, plan, goals, temperature=0.3, top_p=0.9, model="DeepSeek-V3.1-Terminus"):
	# Basic validation
	if not isinstance(incomes, (list, tuple)) or not isinstance(expenses, (list, tuple)):
		raise ValueError("incomes and expenses must be lists.")
	if not isinstance(goals, (list, tuple)):
		raise ValueError("goals must be a list.")

	prompt = f"""
	You are a financial advisor AI. 
	Given the following user details:
	- Income sources: {incomes}
	- Expenses: {expenses}
	- Goals: {goals}
	- Current allocation plan: {plan}

	Provide smart, simple advice on how the user can improve savings, investments,
	and balance between necessities and luxuries. Mention specific actionable insights.
	"""

	client = _get_sambanova_client()

	try:
		response = client.chat.completions.create(
			model=model,
			messages=[
				{"role": "system", "content": "You are a helpful and practical financial assistant."},
				{"role": "user", "content": prompt}
			],
			temperature=temperature,
			top_p=top_p
		)
	except Exception as e:
		# surface API or network errors clearly
		raise RuntimeError(f"Failed to call SambaNova API: {e}") from e

	# Robust extraction of content from different possible response shapes
	content = None
	try:
		content = response.choices[0].message.content
	except Exception:
		try:
			# fallback shape
			content = response.choices[0].text
		except Exception:
			content = str(response)

	return content.strip() if isinstance(content, str) else content

if __name__ == "__main__":
	incomes = [{"source": "salary", "amount": 5000}]
	expenses = [{"name": "rent", "amount": 1500}, {"name": "groceries", "amount": 400}]
	plan = {"savings_rate": "10%"}
	goals = ["emergency fund", "retirement"]

	try:
		result = get_ai_recommendations(incomes, expenses, plan, goals)
		print(result)
	except Exception as err:
		print("Error:", err, file=sys.stderr)