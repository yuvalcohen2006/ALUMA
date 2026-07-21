const Story = () => {
  return (
    <section id="story" className="py-24 md:py-32 bg-background">
      <div className="container-luxury">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="aspect-[4/5] rounded-sm bg-gradient-to-br from-sand to-secondary shadow-luxury relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-display text-xl">
                תמונה תוכנס בהמשך
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-accent rounded-sm hidden md:block" />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="text-xs tracking-[0.3em] uppercase text-primary mb-4">
              הסיפור שלנו
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary mb-6 leading-tight">
              מסורת של מלאכת יד,
              <br />
              <span className="italic">נשימה של מודרניות</span>
            </h2>
            <div className="space-y-5 text-muted-foreground text-lg leading-relaxed">
              <p>
                לפני יותר מחמש עשרה שנה התחלנו במשאלה פשוטה — להחזיר את היופי האמיתי
                לחללי החוץ. כל סלון שיוצא מהסטודיו שלנו הוא תוצאה של דיאלוג בין
                החומר, המקום והאנשים שיחיו בו.
              </p>
              <p>
                אנחנו עובדים עם נגרים, רפדים ומעצבים שחולקים תשוקה אחת — ליצור
                ריהוט שלא רק מרהיב לעין, אלא מחזיק שנים, מספר סיפור ומזמין לשבת.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-border flex flex-wrap gap-8">
              <div>
                <div className="font-display text-2xl text-primary">עיצוב אישי</div>
                <div className="text-sm text-muted-foreground mt-1">
                  לכל לקוח, לכל מרחב
                </div>
              </div>
              <div>
                <div className="font-display text-2xl text-primary">איכות נצחית</div>
                <div className="text-sm text-muted-foreground mt-1">
                  חומרים שעומדים במבחן הזמן
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
