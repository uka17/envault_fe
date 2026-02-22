import { Lock, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 vault-gradient rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-xl">Envault</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Войти</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="vault" size="sm">Начать</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Floating Lock Icon */}
          <div className="mb-8 inline-flex">
            <div className="w-24 h-24 vault-gradient rounded-3xl flex items-center justify-center animate-float vault-glow">
              <Lock className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Защити свои слова
            <span className="block text-gradient">временем</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Отправляй зашифрованные сообщения в будущее. Письма близким, важные данные или послания самому себе — доставка точно в назначенное время.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth?mode=signup">
              <Button variant="vault" size="xl">
                Создать первый stash
              </Button>
            </Link>
            <Link to="/decrypt">
              <Button variant="vault-outline" size="xl">
                У меня есть ключ
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="vault-card text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">End-to-end шифрование</h3>
              <p className="text-muted-foreground text-sm">
                Только получатель с ключом может прочитать сообщение. Даже мы не имеем доступа.
              </p>
            </div>

            <div className="vault-card text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Точная доставка</h3>
              <p className="text-muted-foreground text-sm">
                Запланируй отправку на любую дату — через день, год или десятилетие.
              </p>
            </div>

            <div className="vault-card text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">Гибкий контроль</h3>
              <p className="text-muted-foreground text-sm">
                Откладывай отправку или получай напоминания перед доставкой сообщения.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          © 2024 Envault. Защищай важное.
        </div>
      </footer>
    </div>
  );
};

export default Index;
