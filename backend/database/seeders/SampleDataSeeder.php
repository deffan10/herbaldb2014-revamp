<?php

namespace Database\Seeders;

use App\Models\Compound;
use App\Models\CompoundGroup;
use App\Models\LocalName;
use App\Models\PlantPart;
use App\Models\Reference;
use App\Models\Article;
use App\Models\ArticleAd;
use App\Models\Species;
use App\Models\User;
use App\Models\Virtue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin HerbalDB',
            'email' => 'admin@herbaldb.com',
            'password' => Hash::make('admin123'),
            'institution' => 'HerbalDB Institute',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        $verifier = User::create([
            'name' => 'Verifier HerbalDB',
            'email' => 'verifier@herbaldb.com',
            'password' => Hash::make('verifier123'),
            'institution' => 'HerbalDB Institute',
            'is_active' => true,
        ]);
        $verifier->assignRole('verifier');

        $contributor = User::create([
            'name' => 'Contributor HerbalDB',
            'email' => 'contributor@herbaldb.com',
            'password' => Hash::make('contrib123'),
            'institution' => 'HerbalDB Institute',
            'is_active' => true,
        ]);
        $contributor->assignRole('contributor');

        $ref1 = Reference::create(['source_name' => 'Flora of Java', 'authors' => 'Backer & Bakhuizen', 'year' => 1965]);
        $ref2 = Reference::create(['source_name' => 'Indonesian Medicinal Plants', 'authors' => 'Heyne', 'year' => 1987]);

        $parts = ['Root' => 'Akar', 'Stem' => 'Batang', 'Leaf' => 'Daun', 'Flower' => 'Bunga', 'Fruit' => 'Buah', 'Seed' => 'Biji', 'Rhizome' => 'Rimpang', 'Bark' => 'Kulit Batang'];
        $plantParts = [];
        foreach ($parts as $en => $id) {
            $plantParts[$en] = PlantPart::create(['name' => $id, 'name_en' => $en]);
        }

        $groups = [
            'Alkaloid' => CompoundGroup::create(['name' => 'Alkaloid', 'name_en' => 'Alkaloid']),
            'Flavonoid' => CompoundGroup::create(['name' => 'Flavonoid', 'name_en' => 'Flavonoid']),
            'Terpenoid' => CompoundGroup::create(['name' => 'Terpenoid', 'name_en' => 'Terpenoid']),
            'Saponin' => CompoundGroup::create(['name' => 'Saponin', 'name_en' => 'Saponin']),
            'Phenolic' => CompoundGroup::create(['name' => 'Fenolik', 'name_en' => 'Phenolic']),
        ];

        $speciesData = [
            ['code' => 'SP001', 'name' => 'Curcuma longa', 'family' => 'Zingiberaceae', 'discoverer' => 'L.', 'description' => 'Kunyit adalah tanaman herbal yang umum digunakan sebagai bumbu dan obat tradisional.', 'description_en' => 'Turmeric is a common herb used as spice and traditional medicine.', 'local_names' => ['Kunyit', 'Kunir', 'Koneng'], 'virtues' => [['virtue' => 'Antiinflamasi dan antioksidan', 'part' => 'Rhizome'], ['virtue' => 'Membantu pencernaan', 'part' => 'Rhizome']], 'compounds' => ['Curcumin', 'Demethoxycurcumin', 'Turmerone']],
            ['code' => 'SP002', 'name' => 'Zingiber officinale', 'family' => 'Zingiberaceae', 'discoverer' => 'Roscoe', 'description' => 'Jahe adalah tanaman rimpang yang banyak digunakan sebagai rempah dan obat.', 'description_en' => 'Ginger is a rhizome plant widely used as spice and medicine.', 'local_names' => ['Jahe', 'Jae', 'Jahya'], 'virtues' => [['virtue' => 'Mengatasi mual dan muntah', 'part' => 'Rhizome'], ['virtue' => 'Menghangatkan badan', 'part' => 'Rhizome']], 'compounds' => ['Gingerol', 'Shogaol', 'Zingiberene']],
            ['code' => 'SP003', 'name' => 'Moringa oleifera', 'family' => 'Moringaceae', 'discoverer' => 'Lam.', 'description' => 'Kelor adalah tanaman yang kaya nutrisi dan memiliki banyak manfaat kesehatan.', 'description_en' => 'Moringa is a nutrient-rich plant with many health benefits.', 'local_names' => ['Kelor', 'Merunggai', 'Limaran'], 'virtues' => [['virtue' => 'Kaya vitamin dan mineral', 'part' => 'Leaf'], ['virtue' => 'Menurunkan gula darah', 'part' => 'Leaf']], 'compounds' => ['Quercetin', 'Kaempferol', 'Isothiocyanates']],
            ['code' => 'SP004', 'name' => 'Centella asiatica', 'family' => 'Apiaceae', 'discoverer' => '(L.) Urb.', 'description' => 'Pegagan adalah tanaman obat yang dikenal dapat meningkatkan fungsi kognitif.', 'description_en' => 'Gotu kola is a medicinal plant known to enhance cognitive function.', 'local_names' => ['Pegagan', 'Antanan', 'Kaki Kuda'], 'virtues' => [['virtue' => 'Meningkatkan daya ingat', 'part' => 'Leaf'], ['virtue' => 'Mempercepat penyembuhan luka', 'part' => 'Leaf']], 'compounds' => ['Asiaticoside', 'Madecassoside', 'Asiatic Acid']],
            ['code' => 'SP005', 'name' => 'Andrographis paniculata', 'family' => 'Acanthaceae', 'discoverer' => '(Burm.f.) Nees', 'description' => 'Sambiloto adalah tanaman obat yang dikenal memiliki efek imunomodulator.', 'description_en' => 'Andrographis is a medicinal plant known for its immunomodulatory effects.', 'local_names' => ['Sambiloto', 'Ki Oray', 'Takilo'], 'virtues' => [['virtue' => 'Meningkatkan sistem imun', 'part' => 'Leaf'], ['virtue' => 'Antivirus dan antibakteri', 'part' => 'Leaf']], 'compounds' => ['Andrographolide', 'Neoandrographolide', 'Deoxyandrographolide']],
        ];

        foreach ($speciesData as $data) {
            $species = Species::create([
                'species_code' => $data['code'],
                'scientific_name' => $data['name'],
                'family' => $data['family'],
                'discoverer' => $data['discoverer'],
                'description' => $data['description'],
                'description_en' => $data['description_en'],
                'reference_id' => $ref1->id,
                'created_by' => $admin->id,
                'verified_by' => $admin->id,
                'verified_at' => now(),
                'status' => 'published',
                'is_legacy' => true, // Sample data should not count as user contribution
            ]);

            foreach ($data['local_names'] as $localName) {
                LocalName::create([
                    'species_id' => $species->id,
                    'name' => $localName,
                    'language' => 'id',
                    'created_by' => $admin->id,
                ]);
            }

            foreach ($data['virtues'] as $virtueData) {
                Virtue::create([
                    'species_id' => $species->id,
                    'description' => $virtueData['virtue'],
                    'plant_part_id' => $plantParts[$virtueData['part']]->id,
                    'reference_id' => $ref2->id,
                    'status' => 'published',
                    'created_by' => $admin->id,
                    'is_legacy' => true, // Sample data should not count as user contribution
                ]);
            }

            foreach ($data['compounds'] as $compoundName) {
                $compound = Compound::firstOrCreate(
                    ['name' => $compoundName],
                    [
                        'compound_group_id' => $groups[array_rand($groups)]->id,
                        'status' => 'published',
                        'created_by' => $admin->id,
                        'verified_by' => $admin->id,
                        'verified_at' => now(),
                        'is_legacy' => true, // Sample data should not count as user contribution
                    ]
                );
                $species->compounds()->attach($compound->id, ['plant_part_id' => $plantParts['Rhizome']->id]);
            }
        }

        // Seed sample articles (with tiny placeholder images)
        $placeholder = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApN3WZ4AAAAASUVORK5CYII=');

        $articles = [
            [
                'title' => 'Revitalisasi HerbalDB Indonesia',
                'body_html' => '<p>Pembaruan HerbalDB menghadirkan UI baru, data molekuler, dan workflow kontribusi yang lebih rapi.</p>',
            ],
            [
                'title' => 'Tips Berkontribusi Data Tanaman',
                'body_html' => '<p>Pastikan referensi ilmiah tercantum, lengkapi nama lokal dan khasiat, lalu kirim untuk review.</p>',
            ],
            [
                'title' => 'Mengenal Struktur MOL',
                'body_html' => '<p>File MOL mempermudah visualisasi senyawa. Unggah struktur untuk melengkapi data senyawa bioaktif.</p>',
            ],
        ];

        foreach ($articles as $index => $articleData) {
            $imagePath = 'articles/sample-'.$index.'.png';
            Storage::disk('public')->put($imagePath, $placeholder);

            Article::create([
                'title' => $articleData['title'],
                'slug' => Str::slug($articleData['title']),
                'body_html' => $articleData['body_html'],
                'featured_image_path' => $imagePath,
                'published_at' => now()->subDays($index),
                'created_by' => $admin->id,
            ]);
        }

        // Seed sidebar ads
        for ($i = 1; $i <= 2; $i++) {
            $adPath = 'article-ads/sample-ad-'.$i.'.png';
            Storage::disk('public')->put($adPath, $placeholder);

            ArticleAd::create([
                'title' => 'Support HerbalDB #'.$i,
                'image_path' => $adPath,
                'target_url' => 'https://herbaldb.id/donate',
                'is_active' => true,
                'sort_order' => $i,
            ]);
        }
        $this->command->info('Sample data seeded successfully!');
    }
}
